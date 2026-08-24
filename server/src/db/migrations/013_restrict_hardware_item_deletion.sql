-- Deleting a hardware item previously CASCADE-deleted its checkout and
-- damage-report history (silent data loss from the delete endpoint).
-- RESTRICT makes the delete fail instead; items with history should be
-- retired via status, not destroyed. The API maps the resulting
-- foreign_key_violation to a 409 CONFLICT_ERROR.

ALTER TABLE hardware_checkouts
  DROP CONSTRAINT hardware_checkouts_hardware_item_id_fkey,
  ADD CONSTRAINT hardware_checkouts_hardware_item_id_fkey
    FOREIGN KEY (hardware_item_id) REFERENCES hardware_items(id) ON DELETE RESTRICT;

ALTER TABLE hardware_damage_reports
  DROP CONSTRAINT hardware_damage_reports_hardware_item_id_fkey,
  ADD CONSTRAINT hardware_damage_reports_hardware_item_id_fkey
    FOREIGN KEY (hardware_item_id) REFERENCES hardware_items(id) ON DELETE RESTRICT;
