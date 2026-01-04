export class AuthResponseDto {
  accessToken: string;
  user: { id: string; email: string; fullName?: string | null };
  tenant?: { id: string; name: string; slug: string };
  role?: string;
}
