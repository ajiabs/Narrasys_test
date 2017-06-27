set :application, 'story'
set :repo_url, 'git@github.com:InTheTelling/client.git'
set :scm, :git

set :last_commit, `git rev-list --tags --max-count=1`
ask :branch, proc { `git describe --tags #{fetch(:last_commit)}`.chomp }

# Sometimes ask sets the value to the Proc itself rather than the value.  This only happens when accepting the default value. Calling fetch unrolls that.
# See https://github.com/capistrano/capistrano/issues/859.  They should have just fixed ask when accepting the default value.
set :branch, fetch(:branch)

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

  desc 'Update new relic application id'
  task :update_new_relic_application_id do
    on roles(:app) do
      app_path = File.join(fetch(:release_path), 'dist/vendor.*.min.js')
      execute "sed -i 's/applicationID:\"3997255\"/applicationID:\"#{fetch(:new_relic_application_id)}\"/g' #{app_path}"
    end
  end

  desc 'Compress certain assets for better web serving performance'
  task :compress_assets do
    on roles(:app) do
      dist_path = File.join(fetch(:release_path), 'dist/')
      execute "find -L #{dist_path} \\( -name \"*.js\" \\) -exec bash -c '[ ! -f {}.gz ] && 7z a -tgzip -mx=9 {}.gz {}' \\; "
      execute "find -L #{dist_path} \\( -name \"*.css\" \\) -exec bash -c '[ ! -f {}.gz ] && 7z a -tgzip -mx=9 {}.gz {}' \\; "
    end
  end

  desc 'Update available releases page'  
  task :update_releases_page do
    on roles(:app) do
      releases = capture(:ls, File.join(fetch(:deploy_to), 'releases')).split("\n")
      releases_page = StringIO.new()
      releases_page.write("<html><head><title>Last #{releases.count} Releases</title></head><body>")
      releases_page.write("<h2>Last #{releases.count} Releases</h2>")
      releases.each do |release|
        releases_page.write("<a href=\"/#/?release=#{release}\">#{release}</a><br>")
      end
      releases_page.write("</body></html>")
      releases_page.rewind()
      releases_page_location = File.join(fetch(:deploy_to), 'current/dist/releases.html')
      upload!(releases_page, releases_page_location)
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

  before 'deploy:publishing', 'deploy:compress_assets'
  after :finishing, 'deploy:cleanup'

end

after "deploy:finished", "newrelic:notice_deployment"
