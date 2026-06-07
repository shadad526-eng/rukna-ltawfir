UPDATE public.brands SET sort_order = CASE slug
  WHEN 'nocal' THEN 1
  WHEN 'steviola' THEN 2
  WHEN 'monivo' THEN 3
  WHEN 'baby-tawfir' THEN 4
  WHEN 'bambo-fresh' THEN 5
  WHEN 'isis' THEN 6
  WHEN 'sekem' THEN 7
END WHERE slug IN ('nocal','steviola','monivo','baby-tawfir','bambo-fresh','isis','sekem');