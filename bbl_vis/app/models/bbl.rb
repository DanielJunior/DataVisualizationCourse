class Bbl 
  include Neo4j::ActiveNode
  property :bbl_id, type: Integer
  property :length, type: Float
  property :year, type: Integer



end
