-- Reset Database with Chapter Data
-- Run this in MySQL to add chapters to your database

USE edlearn_db;

-- First, clear existing chapters (if any)
DELETE FROM chapters WHERE id > 0;

-- Insert chapters for CLASS 1 (ID 1)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(1, 1, 'Numbers 1 to 10', 'संख्या 1 से 10', 'ਨੰਬਰ 1 ਤੋਂ 10', 1, 1),
(1, 1, 'Addition Basics', 'जोड़ की मूल बातें', 'ਜੋੜ ਦੀ ਮੂਲ ਚੀਜ़ें', 2, 1),
(1, 1, 'Subtraction Basics', 'घटाव की मूल बातें', 'ਘਟਾਓ ਦੀ ਮੂਲ ਚੀਜ਼ਾਂ', 3, 1),
(2, 1, 'वर्णमाला', 'वर्णमाला', 'ਵਰਨਮਾਲਾ', 1, 1),
(2, 1, 'सरल शब्द', 'सरल शब्द', 'ਸਧਾਰਨ ਸ਼ਬਦ', 2, 1),
(3, 1, 'Alphabet A-Z', 'वर्णमाला A-Z', 'ਅਲਫਾਬੈਟ A-Z', 1, 1),
(3, 1, 'Simple Sentences', 'सरल वाक्य', 'ਸਧਾਰਨ ਵਾਕ', 2, 1),
(4, 1, 'Our Body', 'हमारा शरीर', 'ਸਾਡਾ ਸਰੀਰ', 1, 1),
(4, 1, 'Plants and Animals', 'पौधे और जानवर', 'ਪੌਦੇ ਅਤੇ ਜਾਨਵਰ', 2, 1),
(5, 1, 'My Family', 'मेरा परिवार', 'ਮੇਰਾ ਪਰਿਵਾਰ', 1, 1),
(5, 1, 'My School', 'मेरा स्कूल', 'ਮੇਰਾ ਸਕੂਲ', 2, 1);

-- Insert chapters for CLASS 6 (ID 6)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(1, 6, 'Knowing Our Numbers', 'हमारी संख्याओं को जानना', 'ਸਾਡੀਆਂ ਸੰਖਿਆਵਾਂ ਨੂੰ ਜਾਣਨਾ', 1, 1),
(1, 6, 'Whole Numbers', 'पूर्ण संख्याएँ', 'ਪੂਰੀ ਸੰਖਿਆਵਾਂ', 2, 1),
(1, 6, 'Playing with Numbers', 'संख्याओं के साथ खेलना', 'ਸੰਖਿਆਵਾਂ ਨਾਲ ਖੇਡਣਾ', 3, 1),
(2, 6, 'दो बैलों की कथा', 'दो बैलों की कथा', 'ਦੋ ਬੈਲਾਂ ਦੀ ਕਥਾ', 1, 1),
(2, 6, 'ल्हासा की ओर', 'ल्हासा की ओर', 'ਲ੍ਹਾਸਾ ਵੱਲ', 2, 1),
(3, 6, 'Prose Passage', 'गद्य अंश', 'ਗਦਾ ਖੰਡ', 1, 1),
(3, 6, 'Poem: The Butterfly', 'कविता: तितली', 'ਕਵਿਤਾ: ਤਿਤਲੀ', 2, 1),
(4, 6, 'Combustion and Flame', 'दहन और ज्वाला', 'ਦਹਨ ਅਤੇ ਅੱਗ', 1, 1),
(4, 6, 'Chemical Effects of Electric Current', 'विद्युत प्रवाह का रासायनिक प्रभाव', 'ਬਿਜਲਾ ਮੌਜੂਦਾ ਦਾ ਰਾਸਾਇਣਿਕ ਪ੍ਰਭਾਵ', 2, 1),
(5, 6, 'How, When and Where', 'कैसे, कब और कहाँ', 'ਕਿਵੇਂ, ਕਦੋਂ ਅਤੇ ਕਿੱਥੇ', 1, 1),
(5, 6, 'From Trade to Territory', 'व्यापार से क्षेत्र तक', 'ਵਪਾਰ ਤੋਂ ਖੇਤਰ ਤਕ', 2, 1);

-- Insert chapters for CLASS 8 (ID 10)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(1, 10, 'Rational Numbers', 'परिमेय संख्याएँ', 'ਤਰਕਯੁਕਤ ਸੰਖਿਆਵਾਂ', 1, 1),
(1, 10, 'Linear Equations', 'रैखिक समीकरण', 'ਲੀਨੀਅਰ ਸਮੀਕਰਨ', 2, 1),
(1, 10, 'Quadrilaterals', 'चतुर्भुज', 'ਚਤੁਰਭੁਜ', 3, 1),
(2, 10, 'दीर्घचित्तु', 'दीर्घचित्तु', 'ਦੀਘਾ-ਚਿੰਤਕ', 1, 1),
(2, 10, 'संस्कृत पद्यांश', 'संस्कृत पद्यांश', 'ਸੰਸਕ੍ਰਿਤ ਪਦਾਂਸ਼', 2, 1),
(3, 10, 'Prose Section', 'गद्य भाग', 'ਸਦ ਭਾਗ', 1, 1),
(3, 10, 'Poetry Section', 'कविता भाग', 'ਕਵਿਤਾ ਭਾਗ', 2, 1),
(4, 10, 'Combustion and Flame', 'दहन और ज्वाला', 'ਦਹਨ ਅਤੇ ਅੱਗ', 1, 1),
(4, 10, 'Sound', 'ध्वनि', 'ਆਵਾਜ', 2, 1),
(5, 10, 'How, When and Where', 'कैसे, कब और कहाँ', 'ਕਿਵੇਂ, ਕਦੋਂ ਅਤੇ ਕਿੱਥੇ', 1, 1),
(5, 10, 'From Trade to Territory', 'व्यापार से क्षेत्र तक', 'ਵਪਾਰ ਤੋਂ ਖੇਤਰ ਤਕ', 2, 1);

-- Verify chapters were inserted
SELECT COUNT(*) as total_chapters FROM chapters;
SELECT class_id, subject_id, COUNT(*) as count FROM chapters GROUP BY class_id, subject_id;

