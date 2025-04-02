export interface LoginResponseDto {
  message: string;
  statusCode: number;
  token: string;
  user_id: string;
}