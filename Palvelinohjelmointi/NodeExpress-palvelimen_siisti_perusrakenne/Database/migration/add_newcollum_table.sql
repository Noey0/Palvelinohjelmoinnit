ALTER TABLE customer
DROP COLUMN IF EXISTS password;

ALTER TABLE system_user
ADD COLUMN IF NOT EXISTS password VARCHAR(255) AFTER email;

UPDATE system_user
SET password = NULL
WHERE admin = 0;

UPDATE system_user
SET password = '$2b$10$ULJmU2jl/61LJlY/JwX5O.T.jjDSoMkvUvg9.3pcgLtZX2K3kpgKG'
WHERE admin = 1;