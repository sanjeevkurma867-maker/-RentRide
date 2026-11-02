function hasColumn(db, table, col) { return db.prepare(`PRAGMA table_info(${table})`).all().some(c => c.name === col); }
function addColumn(db, table, col, ddl) { if (!hasColumn(db, table, col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`); }
export function migrate(db) {
  db.pragma('foreign_keys = ON');
  const additions = {
    users: [['phone_verified','INTEGER NOT NULL DEFAULT 0'],['license_no','TEXT'],['avg_reply_minutes','REAL'],['trust_score','INTEGER'],['trust_updated_at','TEXT'],['is_demo','INTEGER NOT NULL DEFAULT 0'],['notify_email','INTEGER NOT NULL DEFAULT 1'],['notify_sms','INTEGER NOT NULL DEFAULT 0']],
    vehicles: [['registration_no','TEXT'],['rating','REAL']],
    messages: [['kind',"TEXT NOT NULL DEFAULT 'text'"],['offer_id','INTEGER']],
    bookings: [['rate_per_hour','REAL'],['list_price_per_hour','REAL'],['offer_id','INTEGER'],['handover_state',"TEXT NOT NULL DEFAULT 'none'"]]
  };
  for (const [table, cols] of Object.entries(additions)) for (const [col, ddl] of cols) addColumn(db, table, col, ddl);
  db.exec(`UPDATE bookings SET rate_per_hour=total*1.0/hours WHERE rate_per_hour IS NULL AND hours>0;
    UPDATE bookings SET list_price_per_hour=rate_per_hour WHERE list_price_per_hour IS NULL;
    UPDATE bookings SET handover_state='pickup_pending' WHERE status='accepted' AND handover_state='none';
    UPDATE bookings SET handover_state='returned' WHERE status='completed' AND handover_state='none';
    CREATE TABLE IF NOT EXISTS conversations(id INTEGER PRIMARY KEY AUTOINCREMENT, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE, renter_id INTEGER NOT NULL REFERENCES users(id), owner_id INTEGER NOT NULL REFERENCES users(id), UNIQUE(vehicle_id,renter_id,owner_id));
    CREATE TABLE IF NOT EXISTS offers(id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE, renter_id INTEGER NOT NULL REFERENCES users(id), owner_id INTEGER NOT NULL REFERENCES users(id), created_by INTEGER NOT NULL REFERENCES users(id), price_per_hour REAL NOT NULL, list_price_per_hour REAL NOT NULL, hours INTEGER, note TEXT, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected','countered','withdrawn','expired','used')), parent_offer_id INTEGER REFERENCES offers(id), expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT(datetime('now')), responded_at TEXT);
    CREATE INDEX IF NOT EXISTS idx_offers_conv ON offers(conversation_id,id);
    CREATE TABLE IF NOT EXISTS otp_codes(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,phone TEXT NOT NULL,code TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,expires_at TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT(datetime('now')));
    CREATE TABLE IF NOT EXISTS reviews(id INTEGER PRIMARY KEY AUTOINCREMENT,vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),renter_id INTEGER NOT NULL REFERENCES users(id),stars INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5),comment TEXT,created_at TEXT NOT NULL DEFAULT(datetime('now')));
    CREATE TABLE IF NOT EXISTS handover_checks(id INTEGER PRIMARY KEY AUTOINCREMENT,booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,stage TEXT NOT NULL CHECK(stage IN ('pickup','return')),recorded_by INTEGER NOT NULL REFERENCES users(id),odometer_km INTEGER,level_percent INTEGER,checklist TEXT NOT NULL,notes TEXT,damage_notes TEXT,status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','confirmed','disputed')),revision INTEGER NOT NULL DEFAULT 1,responded_by INTEGER REFERENCES users(id),response_note TEXT,responded_at TEXT,created_at TEXT NOT NULL DEFAULT(datetime('now')),UNIQUE(booking_id,stage));
    CREATE TABLE IF NOT EXISTS handover_photos(id INTEGER PRIMARY KEY AUTOINCREMENT,check_id INTEGER NOT NULL REFERENCES handover_checks(id) ON DELETE CASCADE,uploaded_by INTEGER NOT NULL REFERENCES users(id),label TEXT NOT NULL,url TEXT NOT NULL,sha256 TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT(datetime('now')));
    CREATE INDEX IF NOT EXISTS idx_hphotos_check ON handover_photos(check_id);
    CREATE TABLE IF NOT EXISTS notification_log(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,channel TEXT NOT NULL CHECK(channel IN ('email','sms')),kind TEXT NOT NULL,ref_id INTEGER,status TEXT NOT NULL CHECK(status IN ('sent','failed','skipped')),detail TEXT,created_at TEXT NOT NULL DEFAULT(datetime('now')));
    CREATE INDEX IF NOT EXISTS idx_notiflog ON notification_log(user_id,channel,kind,ref_id,created_at);`);
}
