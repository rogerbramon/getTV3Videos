require 'sinatra'
require 'net/http'
require 'active_support/core_ext'
require 'json'

set :public_folder, Proc.new { File.join(root, "public") }

get '/videos/:code' do
    formatsURI = URI("http://www.tv3.cat/pvideo/FLV_bbd_dadesItem.jsp?idint=" + params[:code])

    response = Hash.from_xml(Net::HTTP.get(formatsURI))["item"]

    outputVideos = []
    response["videos"]["video"].each do |video|
        fileURI = URI("http://www.tv3.cat/pshared/video/FLV_bbd_media.jsp?ID=" + params[:code] + "&QUALITY=" + video["qualitat"] + "&FORMAT=" + video["format"] + "&PROFILE=HTML5")
        # output += "<li>Format: " + video["format"] + ", Qualitat: " + video["qualitat"] + " <a href=\"" + Hash.from_xml(Net::HTTP.get(uri2))["tv3alacarta"]["item"]["media"] + "\">Descarregar Video</a> </li>"

        outputVideos << {
            format: video["format"],
            quality: video["qualitat"],
            url: Hash.from_xml(Net::HTTP.get(fileURI))["tv3alacarta"]["item"]["media"]
        }
    end

    output = {
        title: response["title"],
        description: response["desc"],
        imgsrc: response["imgsrc"],
        videos: outputVideos
    }

    status 200
    body(JSON.pretty_generate(output))
end

get '/' do
    send_file File.expand_path('index.html', settings.public_folder)
end
