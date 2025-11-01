-- Create reports table for Report Generator Agent
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL, -- 'analysis', 'quality', 'scheduled'
  content JSONB NOT NULL, -- Store report structure and data
  format TEXT DEFAULT 'pdf', -- 'pdf', 'excel', 'csv', 'powerpoint'
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scheduled_reports table for automation
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  day_of_week INTEGER, -- 0-6 for weekly
  day_of_month INTEGER, -- 1-31 for monthly
  time_of_day TIME DEFAULT '09:00:00',
  email_recipients TEXT[] DEFAULT '{}',
  report_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dashboards table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  layout JSONB NOT NULL, -- Store dashboard layout and widget configuration
  refresh_interval INTEGER DEFAULT 300, -- seconds
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dashboard_widgets table
CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL, -- 'chart', 'metric', 'table', 'gauge'
  title TEXT NOT NULL,
  config JSONB NOT NULL, -- Store widget configuration
  position_x INTEGER,
  position_y INTEGER,
  width INTEGER DEFAULT 4,
  height INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create data_quality_reports table
CREATE TABLE IF NOT EXISTS public.data_quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  quality_score DECIMAL(5, 2), -- 0-100
  missing_values JSONB, -- column -> count
  duplicate_rows INTEGER,
  outliers JSONB, -- column -> count
  data_type_issues JSONB,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_update_own" ON public.reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reports_delete_own" ON public.reports FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scheduled_reports
CREATE POLICY "scheduled_reports_select_own" ON public.scheduled_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scheduled_reports_insert_own" ON public.scheduled_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scheduled_reports_update_own" ON public.scheduled_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "scheduled_reports_delete_own" ON public.scheduled_reports FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for dashboards
CREATE POLICY "dashboards_select_own" ON public.dashboards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dashboards_insert_own" ON public.dashboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dashboards_update_own" ON public.dashboards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "dashboards_delete_own" ON public.dashboards FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for dashboard_widgets
CREATE POLICY "dashboard_widgets_select_own" ON public.dashboard_widgets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.dashboards WHERE dashboards.id = dashboard_widgets.dashboard_id AND dashboards.user_id = auth.uid()));
CREATE POLICY "dashboard_widgets_insert_own" ON public.dashboard_widgets FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.dashboards WHERE dashboards.id = dashboard_widgets.dashboard_id AND dashboards.user_id = auth.uid()));
CREATE POLICY "dashboard_widgets_update_own" ON public.dashboard_widgets FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.dashboards WHERE dashboards.id = dashboard_widgets.dashboard_id AND dashboards.user_id = auth.uid()));
CREATE POLICY "dashboard_widgets_delete_own" ON public.dashboard_widgets FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.dashboards WHERE dashboards.id = dashboard_widgets.dashboard_id AND dashboards.user_id = auth.uid()));

-- RLS Policies for data_quality_reports
CREATE POLICY "data_quality_reports_select_own" ON public.data_quality_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "data_quality_reports_insert_own" ON public.data_quality_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "data_quality_reports_delete_own" ON public.data_quality_reports FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_dataset_id ON public.reports(dataset_id);
CREATE INDEX idx_scheduled_reports_user_id ON public.scheduled_reports(user_id);
CREATE INDEX idx_scheduled_reports_next_run ON public.scheduled_reports(next_run_at);
CREATE INDEX idx_dashboards_user_id ON public.dashboards(user_id);
CREATE INDEX idx_dashboard_widgets_dashboard_id ON public.dashboard_widgets(dashboard_id);
CREATE INDEX idx_data_quality_reports_dataset_id ON public.data_quality_reports(dataset_id);
