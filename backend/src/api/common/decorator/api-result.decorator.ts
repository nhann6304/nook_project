import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiEnvelopeDto, CursorPageDto } from '../dto/index.js';

/**
 * Khai câu trả lời của một cửa, ĐÃ tính cả cái vỏ chung.
 *
 *   @ApiResult(UserProfileDto)          → { ok, code, requestId, data: {…} }
 *   @ApiResult(MomentDto, { list: true }) → data là mảng
 *   @ApiNoData()                        → data: null
 *
 * Không có ba cái này thì mỗi cửa phải tự tay tả lại cái vỏ, mà tả tay thì sẽ
 * có chỗ tả sai — và Swagger sai còn tệ hơn Swagger không có, vì người ta tin nó.
 */
export function ApiResult<M extends Type<unknown>>(model: M, options?: { list?: boolean }) {
  const data = options?.list
    ? { type: 'array' as const, items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };

  return applyDecorators(
    ApiExtraModels(ApiEnvelopeDto, model),
    ApiOkResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(ApiEnvelopeDto) }, { properties: { data } }],
      },
    }),
  );
}

/** Cửa trả về một trang lật bằng con trỏ. */
export function ApiCursorResult<M extends Type<unknown>>(model: M) {
  return applyDecorators(
    ApiExtraModels(ApiEnvelopeDto, CursorPageDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiEnvelopeDto) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(CursorPageDto) },
                  { properties: { items: { type: 'array', items: { $ref: getSchemaPath(model) } } } },
                ],
              },
            },
          },
        ],
      },
    }),
  );
}

/** Cửa làm xong việc nhưng không có gì để trả về. */
export function ApiNoData() {
  return applyDecorators(
    ApiExtraModels(ApiEnvelopeDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiEnvelopeDto) },
          { properties: { data: { type: 'object', nullable: true, example: null } } },
        ],
      },
    }),
  );
}
