class BblController < ApplicationController

  def index
    @bbls = Bbl.all
  end

  def bbls

    json = {
        "nodes": [
            {
                "id": "BBL1",
                "length": 10
            },
            {
                "id": "BBL2",
                "length": 6
            },
            {
                "id": "BBL3",
                "length": 4
            },
            {
                "id": "BBL4",
                "length": 2
            },
            {
                "id": "BBL5",
                "length": 2
            }
        ],
        "links": [
            {
                "source": "BBL1",
                "target": "BBL2",
                "value": 1
            },
            {
                "source": "BBL1",
                "target": "BBL3",
                "value": 1
            },
            {
                "source": "BBL3",
                "target": "BBL4",
                "value": 1
            },
            {
                "source": "BBL3",
                "target": "BBL5",
                "value": 1
            }
        ]
    }

    respond_to do |format|
      format.html
      format.json {
        render :json => json
      }
    end
  end
end
