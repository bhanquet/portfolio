export type FormState =
  | {
      error: string;
    }
  | undefined;

export type SessionData = {
  userId: number;
  userName: string;
  userRole: string;
};
