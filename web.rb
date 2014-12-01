require 'sinatra'
require 'net/http'
require 'active_support/core_ext'
require 'json'

set :public_folder, Proc.new { File.join(root, "public") }

get '/videos/:code' do
    baseURL = "http://dinamics.ccma.cat/pvideo/media.jsp?media=video&version=0s&idint=" + params[:code] 
    
    response = JSON.parse(Net::HTTP.get(URI(baseURL + "&profile=pc")).force_encoding("iso-8859-1"))
    
    outputVideos = []
    if !response.empty? && response["informacio"]["estat"]["actiu"]
        
        # Video like tv3.cat
        videoPC = response["media"]

        outputVideos << {
            format: videoPC["format"],
            quality: "Mitjana",
            url: videoPC["url"]
        }

        # Video like TV3 Smart TV App
        videoTV = JSON.parse(Net::HTTP.get(URI(baseURL + "&profile=tv")))["media"]

        outputVideos << {
            format: videoTV["format"],
            quality: "Alta",
            url: videoTV["url"]
        }
    end

    output = {
        title: response["informacio"]["titol"],
        description: response["informacio"]["descripcio"],
        imgsrc: response["imatges"]["url"],
        videos: outputVideos
    }

    status 200
    content_type :json
    output.to_json
end

get '/' do
    send_file File.expand_path('index.html', settings.public_folder)
end

