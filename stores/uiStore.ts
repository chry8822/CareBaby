import { create } from 'zustand';

export type ModalVariant = 'alert' | 'confirm' | 'bottom-sheet';
export type ToastType = 'success' | 'error' | 'info';

export interface ModalPrimaryAction {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
}

export interface ModalSecondaryAction {
  label: string;
  onPress: () => void;
}

interface ModalState {
  visible: boolean;
  variant?: ModalVariant;
  title?: string;
  message?: string;
  primaryAction?: ModalPrimaryAction;
  secondaryAction?: ModalSecondaryAction;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

interface UIState {
  modal: ModalState;
  showModal: (options: Omit<ModalState, 'visible'>) => void;
  hideModal: () => void;

  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  modal: {
    visible: false,
  },

  showModal: (options) =>
    set({ modal: { ...options, visible: true } }),

  hideModal: () =>
    set({ modal: { visible: false } }),

  toast: {
    visible: false,
    message: '',
    type: 'success',
  },

  showToast: (message, type = 'success') =>
    set({ toast: { visible: true, message, type } }),

  hideToast: () =>
    set((state) => ({ toast: { ...state.toast, visible: false } })),
}));
