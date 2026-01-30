-- Reserve-One: 予約管理システム スキーマ
-- Supabase SQL Editor で実行してください。
-- ※ profiles が既に存在する場合（他アプリと共用）は、0. をスキップして 1. から実行してください。

-- ============================================================
-- 0. profiles が無い場合のみ作成（新規 Supabase プロジェクト用）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  "role" text NOT NULL DEFAULT 'customer',
  updated_at timestamptz DEFAULT now()
);

-- 新規ユーザー登録時に profiles 行を作成（既存トリガーと競合しないよう別名を使用）
CREATE OR REPLACE FUNCTION public.reserve_one_ensure_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, "role")
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name'),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS reserve_one_on_auth_user_created ON auth.users;
CREATE TRIGGER reserve_one_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.reserve_one_ensure_profile();

-- ============================================================
-- 1. profiles に "role" および表示名用カラムを追加（既存を壊さない）
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'customer';
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text;

-- CHECK 制約（teacher は math-challenge 等との共存のため許可）
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS reserve_one_profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT reserve_one_profiles_role_check
  CHECK ("role" IN ('admin', 'customer', 'teacher'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles("role");

-- ============================================================
-- 2. slots テーブル（Reserve-One 専用）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_booked boolean NOT NULL DEFAULT false,
  booked_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT slots_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_slots_start_time ON public.slots(start_time);
CREATE INDEX IF NOT EXISTS idx_slots_is_booked ON public.slots(is_booked);
CREATE INDEX IF NOT EXISTS idx_slots_booked_by ON public.slots(booked_by);

-- ============================================================
-- 3. slots の RLS のみ設定（profiles の RLS は既存のまま）
-- ============================================================
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "slots_select_all" ON public.slots;
CREATE POLICY "slots_select_all"
  ON public.slots FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "slots_update_admin" ON public.slots;
CREATE POLICY "slots_update_admin"
  ON public.slots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles."role" = 'admin'
    )
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "slots_update_customer" ON public.slots;
CREATE POLICY "slots_update_customer"
  ON public.slots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p."role" = 'customer'
    )
    AND (
      booked_by = auth.uid()
      OR is_booked = false
    )
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "slots_insert_admin" ON public.slots;
CREATE POLICY "slots_insert_admin"
  ON public.slots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles."role" = 'admin'
    )
  );

DROP POLICY IF EXISTS "slots_delete_admin" ON public.slots;
CREATE POLICY "slots_delete_admin"
  ON public.slots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles."role" = 'admin'
    )
  );

-- ============================================================
-- 4. 管理者ロール設定用トリガー（既存の on_auth_user_created は触らない）
-- 新規サインアップ時、指定メールのみ "role" = 'admin' に更新する。
-- ============================================================
CREATE OR REPLACE FUNCTION public.reserve_one_set_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email IN (
    'mitamuraka@haguroko.ed.jp'
    -- 管理者にしたいメールを追加: 'your-admin@yourdomain.com'
  ) THEN
    UPDATE public.profiles SET "role" = 'admin' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reserve_one_set_admin_role_trigger ON auth.users;
CREATE TRIGGER reserve_one_set_admin_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.reserve_one_set_admin_role();
