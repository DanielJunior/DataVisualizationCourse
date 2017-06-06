class CreateBbl < Neo4j::Migrations::Base
  def up
    add_constraint :Bbl, :uuid
  end

  def down
    drop_constraint :Bbl, :uuid
  end
end
