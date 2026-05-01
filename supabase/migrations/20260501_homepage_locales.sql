-- 20260501_homepage_locales.sql
--
-- Fills in pt_pt / ru / es for homepage namespaces that were seeded with
-- English-only by 20260429_hero_translations.sql and
-- 20260501_homepage_translations.sql:
--
--   * hero
--   * private_access
--   * footer
--   * cookies
--
-- The `services` namespace is excluded — it was populated via the admin UI.
-- The `questionnaire`, `investment`, `nav`, `contact` namespaces already
-- have their non-EN locales filled.
--
-- Uses COALESCE(NULLIF(col, ''), v.col) so any value already filled by an
-- admin survives — only NULL or empty cells get written.

-- ── hero ────────────────────────────────────────────────────────────────

update public.translations t
set pt_pt = coalesce(nullif(t.pt_pt, ''), v.pt_pt),
    ru    = coalesce(nullif(t.ru,    ''), v.ru),
    es    = coalesce(nullif(t.es,    ''), v.es),
    updated_at = now()
from (values
    ('eyebrow',
        'Casas · Vida · Coleccionar',
        'Дома · Жизнь · Коллекционирование',
        'Casas · Vida · Coleccionar'),
    ('logo',
        'LUME', 'LUME', 'LUME'),
    ('logo_subtitle',
        'por Mark', 'от Mark', 'por Mark'),
    ('tagline',
        'A sua luz para viver em Portugal',
        'Ваш свет для жизни в Португалии',
        'Su luz para vivir en Portugal'),
    ('cta_explore_homes',
        'Explorar Casas',
        'Смотреть дома',
        'Explorar Casas'),
    ('cta_let_us_guide_you',
        'Deixe-nos guiá-lo',
        'Позвольте нам сопровождать вас',
        'Déjenos guiarle'),
    ('scroll',
        'Deslizar', 'Прокрутить', 'Desplazar')
) as v(key, pt_pt, ru, es)
where t.namespace = 'hero' and t.key = v.key;


-- ── private_access ──────────────────────────────────────────────────────

update public.translations t
set pt_pt = coalesce(nullif(t.pt_pt, ''), v.pt_pt),
    ru    = coalesce(nullif(t.ru,    ''), v.ru),
    es    = coalesce(nullif(t.es,    ''), v.es),
    updated_at = now()
from (values
    ('eyebrow',
        'Acesso Privado',
        'Частный доступ',
        'Acceso Privado'),
    ('title',
        'Comece a Conversa',
        'Начните разговор',
        'Inicie la Conversación'),
    ('intro',
        'Solicite uma consulta privada com a nossa equipa. Partilhe a sua visão e iremos preparar um plano à sua medida para a sua vida em Portugal.',
        'Запросите частную консультацию у нашей команды. Расскажите о своих планах — мы подготовим индивидуальный план вашей жизни в Португалии.',
        'Solicite una consulta privada con nuestro equipo. Comparta su visión y prepararemos un plan a medida para su vida en Portugal.'),
    ('name_placeholder',
        'Nome completo',
        'Полное имя',
        'Nombre completo'),
    ('email_placeholder',
        'E-mail',
        'Электронная почта',
        'Correo electrónico'),
    ('phone_placeholder',
        'Telefone',
        'Телефон',
        'Teléfono'),
    ('message_placeholder',
        'Conte-nos sobre a sua visão...',
        'Расскажите нам о своих планах...',
        'Cuéntenos su visión...'),
    ('submit',
        'Solicitar Acesso Privado',
        'Запросить частный доступ',
        'Solicitar Acceso Privado'),
    ('submitting',
        'A enviar...',
        'Отправка...',
        'Enviando...'),
    ('error_fallback',
        'Ocorreu um erro. Por favor, tente novamente.',
        'Что-то пошло не так. Пожалуйста, попробуйте ещё раз.',
        'Algo salió mal. Por favor, inténtalo de nuevo.'),
    ('thank_you_title',
        'Obrigado',
        'Спасибо',
        'Gracias'),
    ('thank_you_body',
        'Um membro da nossa equipa entrará em contacto dentro de 24 horas.',
        'Наш специалист свяжется с вами в течение 24 часов.',
        'Un miembro de nuestro equipo se pondrá en contacto en 24 horas.')
) as v(key, pt_pt, ru, es)
where t.namespace = 'private_access' and t.key = v.key;


-- ── footer ──────────────────────────────────────────────────────────────

update public.translations t
set pt_pt = coalesce(nullif(t.pt_pt, ''), v.pt_pt),
    ru    = coalesce(nullif(t.ru,    ''), v.ru),
    es    = coalesce(nullif(t.es,    ''), v.es),
    updated_at = now()
from (values
    ('logo_alt',
        'LUME by Mark', 'LUME by Mark', 'LUME by Mark'),
    ('copyright',
        '© 2026 LUME by Mark · Imobiliário, Relocação e Investimento · Portugal',
        '© 2026 LUME by Mark · Недвижимость, переезд и инвестиции · Португалия',
        '© 2026 LUME by Mark · Inmobiliaria, Relocación e Inversión · Portugal')
) as v(key, pt_pt, ru, es)
where t.namespace = 'footer' and t.key = v.key;


-- ── cookies ─────────────────────────────────────────────────────────────

update public.translations t
set pt_pt = coalesce(nullif(t.pt_pt, ''), v.pt_pt),
    ru    = coalesce(nullif(t.ru,    ''), v.ru),
    es    = coalesce(nullif(t.es,    ''), v.es),
    updated_at = now()
from (values
    ('message',
        'Utilizamos cookies para guardar as suas preferências e melhorar a sua experiência.',
        'Мы используем cookies, чтобы сохранять ваши предпочтения и улучшать опыт.',
        'Utilizamos cookies para recordar sus preferencias y mejorar su experiencia.'),
    ('privacy_link',
        'Política de Privacidade',
        'Политика конфиденциальности',
        'Política de Privacidad'),
    ('decline',
        'Recusar', 'Отклонить', 'Rechazar'),
    ('accept',
        'Aceitar', 'Принять', 'Aceptar')
) as v(key, pt_pt, ru, es)
where t.namespace = 'cookies' and t.key = v.key;
