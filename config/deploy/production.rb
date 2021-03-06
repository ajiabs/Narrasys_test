set :stage, :production
set :rails_env, "production"
set :new_relic_application_id, "4211337"

# Simple Role Syntax
# ==================
# Supports bulk-adding hosts to roles, the primary
# server in each group is considered to be the first
# unless any hosts have the primary property set.
server 'deploy@10.0.100.140', roles: [:app], ssh_options: { :forward_agent => true, :keys => [File.join(ENV["HOME"], ".ssh", "tellit.pem")], :proxy => Net::SSH::Proxy::Command.new('ssh -i ~/.ssh/tellit.pem -l deploy util01.narrasys.com -W %h:%p') }
server 'deploy@10.0.101.140', roles: [:app], ssh_options: { :forward_agent => true, :keys => [File.join(ENV["HOME"], ".ssh", "tellit.pem")], :proxy => Net::SSH::Proxy::Command.new('ssh -i ~/.ssh/tellit.pem -l deploy util01.narrasys.com -W %h:%p') }

# Extended Server Syntax
# ======================
# This can be used to drop a more detailed server
# definition into the server list. The second argument
# something that quacks like a has can be used to set
# extended properties on the server.
#server 'example.com', user: 'deploy', roles: %w{web app}, my_property: :my_value

# you can set custom ssh options
# it's possible to pass any option but you need to keep in mind that net/ssh understand limited list of options
# you can see them in [net/ssh documentation](http://net-ssh.github.io/net-ssh/classes/Net/SSH.html#method-c-start)
# set it globally
#  set :ssh_options, {
#    keys: %w(/home/rlisowski/.ssh/id_rsa),
#    forward_agent: false,
#    auth_methods: %w(password)
#  }
# and/or per server
# server 'example.com',
#   user: 'user_name',
#   roles: %w{web app},
#   ssh_options: {
#     user: 'user_name', # overrides user setting above
#     keys: %w(/home/user_name/.ssh/id_rsa),
#     forward_agent: false,
#     auth_methods: %w(publickey password)
#     # password: 'please use keys'
#   }
# setting per server overrides global ssh_options

# fetch(:default_env).merge!(rails_env: :production)
before "deploy:compress_assets", "deploy:update_new_relic_application_id"
