set :application, 'story'
set :repo_url, 'git@github.com:InTheTelling/client.git'
set :scm, :git

set :last_commit, `git rev-list --tags --max-count=1`
ask :branch, proc { `git describe --tags #{fetch(:last_commit)}`.chomp }

set :user, 'deploy'
set :deploy_to, "/home/deploy/#{fetch(:application)}"
set :deploy_via, :remote_cache
set :ssh_options, { :forward_agent => true, :keys => [File.join(ENV["HOME"], ".ssh", "tellit.pem")] }

# set :format, :pretty
# set :log_level, :debug
# set :pty, true

# set :linked_files, %w{config/database.yml}
# set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

# set :default_env, { path: "/opt/ruby/bin:$PATH" }
set :keep_releases, 15

set :newrelic_revision, "Client #{fetch(:branch)}"

namespace :deploy do

  desc 'Restart application'
  task :restart do
    on roles(:app), in: :sequence, wait: 5 do
      # Your restart mechanism here, for example:
      # execute :touch, release_path.join('tmp/restart.txt')
    end
  end

  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      # Here we can do anything such as:
      # within release_path do
      #   execute :rake, 'cache:clear'
      # end
    end
  end

  after :finishing, 'deploy:cleanup'

end

after "deploy:finished", "newrelic:notice_deployment"
