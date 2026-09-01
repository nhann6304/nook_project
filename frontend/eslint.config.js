/**
 * Luật ở đây KHÔNG phải để bắt lỗi cú pháp — tsc lo việc đó rồi.
 * Nó tồn tại để giữ đúng một lời hứa: giao diện Nook chỉ được lắp từ
 * src/components + src/design, không ai tự chế màu hay tự dựng nút giữa màn hình.
 *
 * Mỗi luật bên dưới đều có câu báo lỗi nói rõ phải làm gì thay thế,
 * để người (hoặc AI) đọc là sửa được ngay, không phải đi hỏi.
 */
const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');

/** Hex trong chuỗi: '#0E0D0C', '#fff'… */
const HEX = String.raw`^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`;
/** rgb()/rgba()/hsl() viết tay */
const CSSFN = String.raw`^(rgba?|hsla?)\(`;

/**
 * Ký tự CHỈ tiếng Việt mới có. Đủ để nhận ra một câu tiếng Việt lọt vào code
 * mà không đụng tới chuỗi tiếng Anh ('email', 'primary'…) hay tên khoá.
 * Chuỗi tiếng Việt không dấu ("Bao nhieu") lọt lưới — chấp nhận được: nó hiếm,
 * và lưới quá chặt thì người ta tắt luật đi, lúc đó mất cả lưới.
 */
const VIET = String.raw`[àáâãèéêìíòóôõùúýăđĩũơưạ-ỹÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐĨŨƠƯẠ-Ỹ]`;

module.exports = defineConfig([
  ...expo,
  { ignores: ['node_modules/**', '.expo/**', 'dist/**', '.doc/**', 'expo-env.d.ts'] },

  /* ---------- Luật áp cho TOÀN BỘ code sản phẩm ---------- */
  {
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=/${HEX}/]`,
          message:
            'Không viết mã màu thẳng trong code. Màu nằm ở src/design/tokens.ts — thêm token mới ở đó rồi import.',
        },
        {
          selector: `Literal[value=/${CSSFN}/]`,
          message:
            'Không viết rgba()/hsl() thẳng trong code. Lớp phủ trong suốt nằm ở src/design/tokens.ts (alpha).',
        },
        {
          selector: `JSXText[value=/${VIET}/]`,
          message:
            'Chữ hiện cho người dùng phải nằm trong kho chữ. Thêm khoá vào src/i18n/locales/vi.ts (và en.ts) rồi gọi t(\'khoá\'). Xem src/i18n/index.ts.',
        },
        {
          selector: `Literal[value=/${VIET}/]`,
          message:
            'Chữ hiện cho người dùng phải nằm trong kho chữ. Thêm khoá vào src/i18n/locales/vi.ts (và en.ts) rồi gọi t(\'khoá\'). Xem src/i18n/index.ts.',
        },
        {
          selector: `TemplateElement[value.raw=/${VIET}/]`,
          message:
            'Chữ hiện cho người dùng phải nằm trong kho chữ. Chuỗi có chỗ trống thì viết "{tên}" trong kho chữ rồi t(\'khoá\', { tên }), đừng ghép bằng dấu ${}.',
        },
        {
          // Chỉ chặn style={{…}} thuần — object dựng lại mỗi lần vẽ mà KHÔNG có
          // lý do gì, vì nội dung nó cố định.
          // style={[s.box, { width: size }]} thì KHÔNG chặn: kích thước tính theo
          // máy hay theo props thì buộc phải dựng lúc chạy, và phần cố định đã
          // nằm trong StyleSheet rồi.
          selector: 'JSXAttribute[name.name="style"] > JSXExpressionContainer > ObjectExpression',
          message:
            'style={{…}} dựng lại object mỗi lần vẽ. Đưa vào StyleSheet.create ở cuối file, hoặc dùng component bố cục (Row/Col/Spacer/Flex).',
        },
      ],
    },
  },

  /* ---------- Chỉ src/components mới được chạm vào primitive thô ---------- */
  {
    files: ['app/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: [
                'Text',
                'TextInput',
                'Button',
                'TouchableOpacity',
                'TouchableHighlight',
                'TouchableWithoutFeedback',
                'Image',
                'SafeAreaView',
                'FlatList',
                'SectionList',
                'ScrollView',
              ],
              message:
                'Dùng bản của Nook trong @ui: Text→Txt, TextInput→Field, Touchable*→Button/IconButton/Tap, Image→Img, SafeAreaView→Screen, FlatList/SectionList→List, ScrollView→Scroll. Bản thô chỉ được dùng bên trong src/components.',
            },
          ],
        },
      ],
    },
  },

  /* ---------- Kho chữ là nơi DUY NHẤT được viết câu tiếng Việt ---------- */
  {
    files: ['src/i18n/**/*.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },

  /* ---------- Dữ liệu giả: tên người, caption mẫu — sẽ xoá khi có server ---------- */
  {
    files: ['src/mocks/**/*.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },

  /* ---------- src/design là gốc: nó ĐƯỢC phép viết hex ---------- */
  {
    files: ['src/design/**/*.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },

  /* ---------- src/components được viết hex? KHÔNG. Chỉ được bỏ luật import ---------- */
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },
]);
