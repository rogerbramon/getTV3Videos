require 'sinatra'
require 'net/http'
require 'active_support/core_ext'
require 'json'

set :public_folder, Proc.new { File.join(root, "public") }

get '/videos/:code' do
    formatsURI = URI("http://www.tv3.cat/pvideo/FLV_bbd_dadesItem.jsp?idint=" + params[:code])

    response = Hash.from_xml(Net::HTTP.get(formatsURI))["item"]

    outputVideos = []
    if response["videos"]["video"].length > 0
        video = response["videos"]["video"][0]

        # Video like tv3.cat
        fileURI = URI("http://www.tv3.cat/pvideo/FLV_bbd_media.jsp?ID=" + params[:code] + "&QUALITY=" + video["qualitat"] + "&FORMAT=" + video["format"] + "&PROFILE=HTML5")
        mediaURL = Hash.from_xml(Net::HTTP.get(fileURI))["tv3alacarta"]["item"]["media"]

        if mediaURL.is_a?(String) && !mediaURL.empty?
            outputVideos << {
                format: video["format"],
                quality: "Mitjana",
                url: mediaURL
            }
        end

        # Video like TV3 Smart TV App
        fileURI = URI("http://www.tv3.cat/pvideo/FLV_bbd_media.jsp?ID=" + params[:code] + "&FORMAT=" + video["format"] + "&PROFILE=iptv")
        mediaHighData = Hash.from_xml(Net::HTTP.get(fileURI))["bbd"]["item"]["media"]
        mediaHighURL = ""

        if mediaHighData.is_a?(Array)
            mediaHighURL = mediaHighData.grep(/media.tv3.cat/)
        elsif mediaHighData.is_a?(String)
            mediaHighURL = mediaHighData
        end

        if !mediaHighURL.empty?
            outputVideos << {
                format: video["format"],
                quality: "Alta",
                url: mediaHighURL
            }
        end
    end

    output = {
        title: response["title"],
        description: response["desc"],
        imgsrc: response["imgsrc"],
        videos: outputVideos
    }

    status 200
    content_type :json
    output.to_json
end

get '/' do
    send_file File.expand_path('index.html', settings.public_folder)
end
