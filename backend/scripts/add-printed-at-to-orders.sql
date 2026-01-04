-- Agregar campo printed_at para print queue
ALTER TABLE public.orders_v2
  ADD COLUMN IF NOT EXISTS printed_at timestamptz;

-- Ejemplo de consulta para print queue en el panel
-- Selecciona órdenes pendientes de imprimir
SELECT * FROM public.orders_v2
WHERE status = 'pending' AND printed_at IS NULL
ORDER BY created_at ASC;
