/**
 * Bộ nắn — bảng thành thứ đi ra ngoài.
 *
 * Vì sao tách ra khỏi dịch vụ: đây là chỗ DUY NHẤT quyết định "người ngoài
 * được thấy gì". Để việc đó nằm rải trong dịch vụ thì sớm muộn có một cửa trả
 * nguyên cả entity ra ngoài — kèm cột `refresh_hash`, kèm `deleted_at`, kèm mọi
 * thứ chưa ai kịp nghĩ tới.
 *
 * Với Nook thì chuyện này còn nặng hơn: luật sản phẩm cấm trả cấp thân của
 * người khác cho người thứ ba. Cấm được hay không phụ thuộc vào chỗ này.
 *
 *   @Injectable()
 *   export class UserMapper extends BaseMapper<User, UserProfileDto> {
 *     toDto(user: User): UserProfileDto { … }
 *   }
 */
export abstract class BaseMapper<Entity, Dto> {
  /** Một cái. Lớp con phải viết. */
  abstract toDto(entity: Entity): Dto;

  /** Nhiều cái. Có sẵn, đừng viết lại. */
  toDtoList(entities: Entity[]): Dto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  /** Có thể không có gì. Tiện cho `findOne` trả `null`. */
  toDtoOrNull(entity: Entity | null | undefined): Dto | null {
    return entity ? this.toDto(entity) : null;
  }
}
