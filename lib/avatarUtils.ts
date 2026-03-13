import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

/** 아바타 업로드 시 리사이즈할 최대 크기 (px) */
const AVATAR_MAX_SIZE = 400;
/** JPEG 압축 품질 (0~1) */
const AVATAR_QUALITY = 0.75;

/**
 * 로컬 이미지 URI를 리사이즈·압축 후 Supabase Storage에 업로드하고 Public URL을 반환한다.
 * - 최대 400×400 px로 축소 (비율 유지)
 * - JPEG 0.75 품질로 압축
 * @param bucket  스토리지 버킷명 ('baby-avatars' | 'user-avatars')
 * @param fileKey 업로드할 파일 키 (확장자 제외, e.g. '{userId}_{timestamp}')
 * @param localUri expo-image-picker가 반환한 로컬 URI
 */
export const uploadAvatarToStorage = async (
  bucket: string,
  fileKey: string,
  localUri: string,
): Promise<string> => {
  // 1. 리사이즈 + JPEG 압축
  const manipulated = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: AVATAR_MAX_SIZE, height: AVATAR_MAX_SIZE } }],
    { compress: AVATAR_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );

  const optimizedUri = manipulated.uri;
  const fileName = `${fileKey}.jpg`;
  const mimeType = 'image/jpeg';

  // 2. base64 읽기
  const base64 = await FileSystem.readAsStringAsync(optimizedUri, {
    encoding: 'base64' as FileSystem.EncodingType,
  });

  // 3. Uint8Array 변환
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // 4. Supabase Storage 업로드
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, bytes, { contentType: mimeType, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
};
