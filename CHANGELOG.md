# Changelog

## 2.0.0

- Refactor the video player for better user experience on mobile and less bug. This video player improved

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