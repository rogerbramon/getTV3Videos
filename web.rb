require 'sinatra'

get '/*' do
    redirect "https://videostv3.vercel.app", 301
end

