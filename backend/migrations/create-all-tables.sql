
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

COMMENT ON TABLE users IS 'Сотрудники студенческого отдела';
COMMENT ON COLUMN users.username IS 'Email сотрудника (@alatoo.edu.kg)';
COMMENT ON COLUMN users.role IS 'Роль: staff (сотрудник) или admin (администратор)';

CREATE TABLE service_types (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  avg_service_time INTEGER DEFAULT 300, 
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_types_is_active ON service_types(is_active);

COMMENT ON TABLE service_types IS 'Типы услуг (справки, отпуска, переводы и т.д.)';
COMMENT ON COLUMN service_types.avg_service_time IS 'Среднее время обслуживания в секундах';

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  ticket_number INTEGER NOT NULL,
  student_name VARCHAR(255) DEFAULT 'Студент',
  purpose VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' 
    CHECK (status IN ('waiting', 'serving', 'completed', 'cancelled')),
  service_type_id INTEGER REFERENCES service_types(id) ON DELETE SET NULL,
  served_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  qr_code TEXT,
  called_at TIMESTAMP,
  completed_at TIMESTAMP,
  wait_time INTEGER, 
  service_time INTEGER, 
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_service_type ON tickets(service_type_id);
CREATE INDEX idx_tickets_served_by ON tickets(served_by);

COMMENT ON TABLE tickets IS 'Талоны электронной очереди';
COMMENT ON COLUMN tickets.ticket_number IS 'Порядковый номер талона (сбрасывается каждый день)';
COMMENT ON COLUMN tickets.status IS 'Статус: waiting (ожидает), serving (обслуживается), completed (завершен), cancelled (отменен)';
COMMENT ON COLUMN tickets.wait_time IS 'Время ожидания в секундах';
COMMENT ON COLUMN tickets.service_time IS 'Время обслуживания в секундах';


CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_tickets INTEGER DEFAULT 0,
  completed_tickets INTEGER DEFAULT 0,
  cancelled_tickets INTEGER DEFAULT 0,
  avg_wait_time INTEGER, 
  avg_service_time INTEGER, 
  peak_hour INTEGER CHECK (peak_hour >= 0 AND peak_hour <= 23),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_date ON analytics(date);

COMMENT ON TABLE analytics IS 'Ежедневная статистика работы очереди';
COMMENT ON COLUMN analytics.peak_hour IS 'Час максимальной загрузки (0-23)';

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_types_updated_at 
  BEFORE UPDATE ON service_types
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at 
  BEFORE UPDATE ON tickets
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at 
  BEFORE UPDATE ON analytics
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO service_types (title, avg_service_time, is_active) VALUES
('Справка об обучении', 300, TRUE),
('Академический отпуск', 600, TRUE),
('Перевод на другую специальность', 900, TRUE),
('Изменение учебного плана', 450, TRUE),
('Консультация', 300, TRUE),
('Прочие вопросы', 400, TRUE);

SELECT 
  'Tables created successfully!' AS message,
  COUNT(*) AS table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
     AND table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;


CREATE TABLE IF NOT EXISTS departments (
  id         SERIAL PRIMARY KEY,
  code       VARCHAR(10)  NOT NULL UNIQUE,
  name_ru    VARCHAR(255) NOT NULL,
  name_en    VARCHAR(255) NOT NULL,
  name_ky    VARCHAR(255) NOT NULL,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (code, name_ru, name_en, name_ky) VALUES
  ('ENG', 'Факультет инженерии и информатики',  'Faculty of Engineering and Informatics', 'Инженерия жана информатика факультети'),
  ('ECO', 'Факультет экономики и управления',    'Faculty of Economics and Management',    'Экономика жана башкаруу факультети'),
  ('SOC', 'Факультет социальных наук',           'Faculty of Social Sciences',             'Социалдык илимдер факультети'),
  ('MED', 'Медицинский факультет',               'Faculty of Medicine',                    'Медицина факультети'),
  ('HUM', 'Факультет гуманитарных наук',         'Faculty of Humanities',                  'Гуманитардык илимдер факультети')
ON CONFLICT (code) DO NOTHING;


ALTER TABLE users
  ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);


ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS purpose_key   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ticket_code   VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_tickets_department ON tickets(department_id);


DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

SELECT 'Migration completed!' AS message;