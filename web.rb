require 'sinatra'
require 'net/http'
require 'active_support/core_ext'
require 'json'

set :public_folder, Proc.new { File.join(root, "public") }

get '/videos/:code' do
    baseURL = "http://dinamics.ccma.cat/pvideo/media.jsp?media=video&version=0s&idint=" + params[:code] 
    
    response = JSON.parse(Net::HTTP.get(URI(baseURL)).force_encoding("iso-8859-1"))
    
    outputVideos = []
    subtitles = nil
    if !response.empty? && response["informacio"]["estat"]["actiu"]
        
        media = response["media"]

        for url in media["url"] 
            outputVideos << {
                format: media["format"],
                quality: url["label"],
                url: url["file"]
            }
        end

        subtitles = response["subtitols"]
    end

    output = {
        title: response["informacio"]["titol"],
        description: response["informacio"]["descripcio"],
        imgsrc: response["imatges"]["url"],
        videos: outputVideos,
        subtitles: subtitles
    }

    status 200
    content_type :json
    output.to_json
end

get '/' do
    send_file File.expand_path('index.html', settings.public_folder)
end

