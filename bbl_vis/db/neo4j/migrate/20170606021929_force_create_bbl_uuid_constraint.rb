class ForceCreateBblUuidConstraint < Neo4j::Migrations::Base
  def up
    add_constraint :Bbl, :uuid, force: true
  end

  def down
    drop_constraint :Bbl, :uuid
  end
end
