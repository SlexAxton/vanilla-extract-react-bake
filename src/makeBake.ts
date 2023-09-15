import { bake } from './bake';
import type {
  ElementTypeOrComponent,
  CreateViewProps,
  ExtractVariants,
} from './types/util';
import type { RuntimeFn } from '@vanilla-extract/recipes';
import type { VariantGroups } from './types/vendor';

export function makeBake<
  I extends Record<string, (value: any) => Record<string, any>>,
>(injectConfig: I) {
  return function <
    T extends ElementTypeOrComponent,
    R extends RuntimeFn<VariantGroups> | Array<string> | string = string,
    Req extends Array<Extract<keyof ExtractVariants<R>, string>> = never[],
    I2 extends Record<string, (value: any) => Record<string, any>> = {},
  >(
    elementType: T,
    recipe?: R,
    config?: {
      required?: Req;
      forward?: Req;
      inject?: I2;
    },
  ): React.ComponentType<
    CreateViewProps<T, R, Req> & {
      [K in keyof I | keyof I2]?: Parameters<(I & I2)[K]>[0];
    }
  > {
    // if we have both an injected config from makeBake
    // and an injected config from bake, we want to merge them
    // but should give priority to the call to bake, rather than the default makeBake
    // In the future we could smartly merge them if we need
    const inject = config?.inject
      ? { ...injectConfig, ...config.inject }
      : injectConfig;
    return bake(elementType, recipe, { ...config, inject });
  };
}
