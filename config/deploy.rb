#############################################################
#    Application
#############################################################

set :application, "narabazi"
set :deploy_to, "/collective/narabazi"

#############################################################
#    Settings
#############################################################

default_run_options[:pty] = true
ssh_options[:forward_agent] = true
set :use_sudo, true
set :scm_verbose, true

#############################################################
#    Servers
#############################################################

set :user, "galligalli01"
set :domain, "galligalli.org"
server domain, :app, :web
role :db, domain, :primary => true

#############################################################
#    Git
#############################################################

set :scm, :git
set :branch, "master"
set :repository,  "git@github.com:sakarp/narabazi.git"
set :deploy_via, :remote_cache
