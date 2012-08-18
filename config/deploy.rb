#############################################################
#    Application
#############################################################

set :application, "narabazi"
set :deploy_to, "collective/narabazi"

#############################################################
#    Settings
#############################################################

default_run_options[:pty] = true
ssh_options[:forward_agent] = true
set :use_sudo, false
set :scm_verbose, true

#############################################################
#    Servers
#############################################################

set :user, "galligalli01"
set :domain, "182.50.148.1"
server domain, :app, :web
role :db, domain, :primary => true

#############################################################
#    Git
#############################################################

set :scm, :git
set :scm_command, "C:\Users\Yeti\AppData\Local\GitHub\PortableGit_8810fd5c2c79c73adcc73fd0825f3b32fdb816e7\bin" #change to my settings
set :local_scm_commander, "git"
set :branch, "master"
set :repository,  "git@github.com:sakarp/narabazi.git"
set :deploy_via, :remote_cache
