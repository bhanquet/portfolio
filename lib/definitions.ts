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

export type Blog = {
  title: string;
  url: string;
  tags: string[];
  summary: string;
  content: string;
};
