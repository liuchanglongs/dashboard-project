import { shallowRef, ref, watchEffect, unref } from "vue";
import type { Ref } from "vue";

interface UseAsyncOptions<T, Params extends any[]> {
  immediate?: boolean;
  shallow?: boolean;
  params?: Params;
  onError?: (err: unknown) => void;
  onSuccess?: (data: T) => void;
  onBefore?: () => void;
}

interface UseAsyncReturn<T, Params extends any[]> {
  data: Ref<T | undefined>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  execute: (...args: Params) => Promise<T | undefined>;
}

export function useAsync<T, Params extends any[] = []>(
  fn: (...args: Params) => Promise<T>,
  options: UseAsyncOptions<T, Params> = {}
): UseAsyncReturn<T, Params> {
  const {
    immediate = true,
    shallow = false,
    params = [] as unknown as Params,
    onError,
    onSuccess,
    onBefore,
  } = options;

  const data = shallow ? shallowRef<T>() : ref<T>();
  const loading = ref(false);
  const error = ref<unknown>();

  const execute = async (...args: any) => {
    try {
      loading.value = true;
      error.value = null;
      onBefore && onBefore();

      const response = await fn(...args);
      data.value = response;

      onSuccess && onSuccess(response);

      return response;
    } catch (err) {
      error.value = err;
      onError && onError(err);
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  if (immediate) {
    watchEffect(() => {
      if (params) {
        execute(params);
      }
    });
  }

  return {
    data,
    loading,
    error,
    execute,
  };
}
