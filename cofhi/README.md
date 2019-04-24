# MiDemo

This is a starter template for [MIDATA](http://midata.coop/) projects.

## How to use this template

Fork this repository and customize all needed think.
You don't to modify:
- the login page and login logic
- the menu (except the new page that you will create)
- the impressum page

You have to modify:
- config.xml
- src/assets/i18n files
- src/assets/img/logo- files
- src/assets/parameters.json
- resources/icon.psd
- resources/splash.psd

then, you can add your new pages.

## With the Ionic CLI
### Install ionic v3 and cordova

```bash
$ sudo npm install -g ionic cordova
```

### Fork this git repository

1. If you haven't yet, you should first set up a git repository.
2. Clone the MiDemo project:

```bash
$ git clone https://gitlab.ti.bfh.ch/midata/MiDemo.git
```
Now, you have a local copy of your fork of the Spoon-Knife repository!

3. Configure Git to sync your fork with the original MiDemo repository

```bash
$ git remote add upstream https://gitserver/YourGitRep
```

To verify the new upstream repository you've specified for your fork, type *git remote -v*. You should see the URL for your fork as origin, and the URL for the original repository as upstream.

The sky's the limit with the changes you can make to a fork, including:

- Creating branches: Branches allow you to build new features or test out ideas without putting your main project at risk.
- Opening pull requests: If you are hoping to contribute back to the original repository, you can send a request to the original author to pull your fork into their repository by submitting a pull request.

### Then, to run it, cd into `MiApp` and run

```bash
$ npm install
$ ionic cordova platform add android
$ ionic cordova run android
```

Substitute ios for android if not on a Mac.

### To test the App in a browser

```bash
$ ionic serve
```

## Create your own app with the MiDemo template

check the wiki page for the documentation

- https://gitlab.ti.bfh.ch/midata/MiDemo/wikis/home