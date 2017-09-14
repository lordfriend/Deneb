# Changelog

## 2.3.1

### Fix bugs:

- home/default component doesn't display the background color of image.
- fix the scrub bar bug when seeking.

## 2.3.0

- update responsive-image component and directive to support new API with image width and height information. now image resize request will make request base on
image height-width ratio.
update bangumi-card to use new responsive image
- Add editor to edit the maintainer and alert_timeout of a bangumi.

## 2.2.0

### Fix bugs:

- Scrubbar occasionally stuck after dragging and switch episodes.
- Bangumi-detail external link cannot be clicked.
- Remove useless code.

### Feature Add

- Add transition effects for image load.
- Add footer links
- Add Terms of Service, Privacy Policy, Developer Document,  Application Showcase.

## 2.1.0

### Feature Add
Add favorite status dropdown in my favorites section of sidebar.

### Bugfix

- fix responsive-image issue in Firefox < 55 and Safari
- disable iOS click blink
- fix scrub-bar progress incorrection when switch between episodes.
- fix #60 and #59
- Add case-insensitive support in search (both bangumi-list and admin)

## 2.0.0

- Refactor the video player for better user experience on mobile and less bug. This video player improved capture functionality in fullscreen state
and fix bug that cannot enter fullscreen in iOS safari.
- Change the strategy of synchronizing watch history. now watch history record will not frequently upload to server. instead client will use new synchronizing
API to batch the operation. this is improve the mobile battery efficiency.
- Add a persistent storage helper to operate with localStorage, this is a user account binding storage, when user logout, all data in localstorage operated by
the helper will be delete.


## 1.1.0

- Add support for responsive image request. every image request will append size={width}x{height} and return the resized image according
 to layout dimension. this will significantly reduce the network usage in image transmission. To support this feature, please read the readme
- Add background color for image placeholder which is dominant color extracted from certain image. this feature require the backend version > 2.1.0

## 1.0.1

- Fix bug when logout a user, authentication still uses the previous use information to authenticate current user permission.
- Hide operation in user-manage page when current user don't have that permission.

## 1.0.0

- Add user-center page for user settings. refactor register, forget password, reset password, remove invite code reset password support.

- Update Readme

## 0.9.2

Remove stalled state and loader visibility is no longer depending on that state

## 0.9.1

Fix a bug in play list #44

## 0.9.0

Add video files edit dialog

## 0.8.0

all bangumi list refactor

## 0.7.0

Admin refactor, a new designed admin panel, adding user management and task management. refactor the interactive for bangumi management.

- support bangumi.moe

currently, thumbnail setting is not support, upload file is removed intentionally.

## 0.6.0

- Add support for hacking login and register page.
