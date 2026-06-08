// lib/types/common.types.ts

export type ActionResult<T = null> = {
    success: boolean;
    message: string;
    data?: T;
};
