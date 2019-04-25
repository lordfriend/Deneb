# Changelog

## 3.6.0

- add tips to register to instruct user not using QQMail.
- add fixsub source to libyk
- change RPC mechanism for browser-extension communication in order to support new extension.

## 3.5.2

- Fix bug that cause controls in config panel of video player cannot be clicked.
- Sort bangumi by secondary property when the primary is equal in Favorite list

## 3.5.1

- Fix bug in favorite list, the timeline doesn't switch with the dropdown selector.

## 3.5.0

- change my bangumi logic. now when user load bangumi-detal and play-episode component,
    a request to check favorite API will be sent, then the highlight color of unwatched count will be removed.

## 3.4.0

- Add filter in user management
- Fix a bug when metadata is unavailable, use shortcut may crash.

## 3.3.1

- remove query string in media URL. which is proofed as useless.

## 3.3.0

- Add toggle to filter movie or ova type in BangumiList and ListBangumi(inside home and admin).
- replace video player config dialog with a popover.
- fix #140
- fix #141

## 3.2.5

- Fix crash in rating component when rating is no defined

## 3.2.4

- Adjust feedback dialog style, fix issues in mobile devices.
- Change feedback button from icon anchor button to basic button.

## 3.2.3

Fix bug on capture when file size is too large.

## 3.2.2

Fix bugs in chrome-extension.service which may cause crash in Android Chrome browser.

## 3.2.1

Change tips for Android apps

## 3.2.0

Add Recommend in default component. Add a new position in announce field to represent recommend bangumi.

## 3.1.0

- Add Nyaa source
- Fix comment bug when reply author self comment.

## 3.0.7

Fix bug in web-hook management editor which cause shared_secret cannot be saved.

## 3.0.6

- Fix the issue in favorite-choose when operating in play-episode page.
- Add chrome extension web store link in static/apps, resume the tip for not installed user.

## 3.0.5

- fix layout issue in play-episode episode title when no episode name presents.
- add sort comment order
- add extra info in play episode.

## 3.0.4

- fix bug in favorite-chooser, some operation may occasionally make EditReviewDialog got stuck. Solve this issue by replacing ApplicationRef#tick() to NgZone#run(). Currently not know why.
- Add a box shadow in feedback dialog.
- Move synchronize invoke out of EditReviewDialog.
- After update favorite, a get favorite request will be sent.

## 3.0.3

Fix bug which may cause crash in bangumi charactor info

## 3.0.2

Fix crash in bangumi detail when some information is null (staff, crt)

## 3.0.1

Fix some bug in non-chrome browser, make sure favorite-chooser works when chrome extension is enabled but account is not bound.

## 3.0.0

### Integration with bangumi account and social feature

This is a feature which enhances the social element in the web client while not relies on Albireo,
it is made available by installing a browser extension.

### Feedback feature

In play-episode component, a user will be able to send feedback about the current episode to admin. this require backend > 2.9.0

### Other improvements

- Delete favorite, require backend > 2.8.0
- VideoPlayer view larger.
- Bangumi page now won't change height when image loaded.

### Bugfix

- typo in TOS
- copyright claim year update in the footer

## 2.8.1

hide video file picker when only one video file exists.

## 2.8.0

Add multiple video file support, video_file dialog in admin will show all the editable field.
But only label and download_url should be edit when adding a new video file. To enable multiple video file playback in
PlayEpisode component, a dropdown picker (or label list when in small screen) is added. note that the backend must be upgraded to 2.7.8 and above to filter
out unfinished video_file to avoid exception.

## 2.7.2

- remove new-year icon
- fix my-bangumi list label incorrectly positioned in Firefox

## 2.7.1

- Add new year logo

## 2.7.0

- Add Favorite page
- remove favorite status selector from sidebar.
- rename my bangumi section to watching section.

## 2.6.4

Fix #105 all bangumi.moe request goes through proxy.

## 2.6.3

fix some bug in pv component

## 2.6.2

Add a PV component under home module. this component is designed for make bangumi PV for a new season. admin could upload pv video and
attach a manifest.json file alongside the video. for convenience video should be placed in albireo data folder with a special directory `preview-video`. so the play can access
the video from `/video/preview-video/{dir}/{file_name}.mp4`. you must give a parameter `p` which is `{dir}/{file_name}`, and if necessary, a parameter
d which is the static file domain.

## 2.6.1

- change the episode delete for API changes.
- Add Christmas tree.

## 2.6.0

- Fix Scrub bar retract bug when seek by keypress

- Add Auto play next episode function

## 2.5.0

### Feature Add

- Web hook Management and web hook setting for end user.
- auto bind web hook token by request settings/user url with token and web_hook_id parameter

### Bug fix and minor changes

- fix title incorrect in user-management, task management, announce management.
- replace external link of bangumi.tv link icon to bgm no.47 emotion.
- add date picker for announcement management dialog.

This update need perform a dependencies upgrade.

## 2.4.5

- Update Webpack to 3 and update other dev dependencies.

- fix bug in admin/bangumi-detail

- remember the selection of default component bangumi type tab.

## 2.4.4

Add custom RouteReuseStrategy. Now some route, like play episode, bangumi detail will not reuse component when parameter changed. this will help fix some issues.

## 2.4.3

Fix webpack config issues which make the Google Fonts request from Google API that may cause some user in tha mainland China experience slow page loading.

## 2.4.2

### Fix Bugs:

- Fix the bug in Admin/BangumiDetail component that sometimes, the request image size is 0x0, this is caused by a null originalWidth and originalHeight.
- Fix the bug in BangumiList which some image doesn't re-measure its dimension when reused by InfiniteList.

### Feature Add

- Keep type, sort, order_by filter status in BangumiList (home and admin) when user leave the component.


## 2.4.1

improve the user experience of bangumi list in Home/BangumiList component and Admin/ListBangumi component. The scroll position will be preserved
 even user leave current component.


## 2.4.0

### Feature Add

Announcement system ui, both control panel in management module and a banner show announce in home/default component

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
