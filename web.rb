require 'sinatra'

get '/' do
    redirect_to "https://videostv3.vercel.app", :status => 301
end

