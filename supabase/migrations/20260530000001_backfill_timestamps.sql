ALTER TABLE public.posts
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.posts SET created_at = now() WHERE created_at IS NULL;
UPDATE public.posts SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE public.likes
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.likes SET created_at = now() WHERE created_at IS NULL;
UPDATE public.likes SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE public.follows
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.follows SET created_at = now() WHERE created_at IS NULL;
UPDATE public.follows SET updated_at = now() WHERE updated_at IS NULL;
