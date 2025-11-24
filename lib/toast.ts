import { toast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

export const showToast = {
    success: (message: string) => {
        toast.success(message, {
            ...defaultOptions,
            autoClose: 3000,
            className: 'toast-success',
        });
    },

    error: (message: string) => {
        toast.error(message, {
            ...defaultOptions,
            autoClose: 5000,
            className: 'toast-error',
        });
    },

    warning: (message: string) => {
        toast.warning(message, {
            ...defaultOptions,
            className: 'toast-warning',
        });
    },

    info: (message: string) => {
        toast.info(message, {
            ...defaultOptions,
            className: 'toast-info',
        });
    },
};
