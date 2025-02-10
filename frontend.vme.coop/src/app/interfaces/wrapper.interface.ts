export interface Wrapper<t> {
  data: t;
  page: number;
  pages: number;
  pageSize: number;
  totalItems: number;
}
