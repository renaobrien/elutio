-- Make contract_address nullable for native tokens
ALTER TABLE tokens ALTER COLUMN contract_address DROP NOT NULL;
