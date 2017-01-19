// This is a JavaScript file

'user strict';

function CloudAPI(httpProtocol) {
    
    this.http       = httpProtocol;
    // this.baseUrl    = "http://12a77170.ngrok.io/";
    this.baseUrl    = "http://superean.com/apps/kamsan/";

    this.liveListUrl                = 'api/live/list/';
    this.liveViewAddUrl             = 'api/live/view/add/';

    this.liveMusicTopListUrl        = 'api/music/list/top';
    this.liveMusicNewListUrl        = 'api/music/list/new';
    this.liveMusicRecentListUrl     = 'api/music/list/recent';
    this.liveMusicRecommendListUrl  = 'api/music/list/recommend';
    this.liveMusicFeatureListUrl    = 'api/music/list/feature';
    this.liveMusicHistoryListUrl    = 'api/music/list/history/';
    this.liveMusicForYouListUrl     = 'api/music/list/for_you/';
    this.liveMusicChartListUrl      = 'api/music/list/chart/';
    this.liveMusicListUrl           = 'api/music/list/album/';
    this.liveArtistMusicListUrl     = 'api/music/list/artist/';
    this.liveMusicDownloadListUrl   = 'api/music/list/download/';
    this.liveMusicConnectListUrl    = 'api/music/list/connect';
    this.liveMusicSaveListUrl       = 'api/music/list/save/';
    this.liveMusicViewAddUrl        = 'api/music/view/add/';
    this.liveMusicSaveAddUrl        = 'api/music/save/add/';
    this.liveMusicSaveCheckUrl      = 'api/music/save/check/';
    this.liveMusicSaveDeleteUrl     = 'api/music/save/delete/';
    this.liveMusicDownloadAddUrl    = 'api/music/download/add/';
    this.liveMusicDownloadDeleteUrl = 'api/music/download/delete/';
    this.liveMusicDownloadCheckUrl  = 'api/music/download/check/';

    this.liveMVListUrl              = 'api/mv/list/all';
    this.liveMVTopListUrl           = 'api/mv/list/top';
    this.liveMVNewListUrl           = 'api/mv/list/new';
    this.liveMVRecentListUrl        = 'api/mv/list/recent';
    this.liveMVDetailListUrl        = 'api/mv/list/album/';    
    this.liveMVViewAddUrl           = 'api/mv/view/add/';
    this.liveMVDetailViewAddUrl     = 'api/mv/detail/view/add/';

    this.liveArtistListUrl          = 'api/artist/list/';
    this.liveAlbumListUrl           = 'api/album/list/';
    this.liveAlbumViewAddUrl        = 'api/album/view/add/';
    this.liveArtistViewAddUrl       = 'api/artist/view/add/';

    this.liveMusicPlaylistListUrl           = 'api/playlist/list/';
    this.liveMusicPlaylistFeatureListUrl    = 'api/playlist/feature';
    this.liveMusicPlaylistDetailListUrl     = 'api/playlist/detail/';
    this.liveMusicPlaylistAddUrl            = 'api/playlist/add/';
    this.liveMusicPlaylistDeleteUrl         = 'api/playlist/delete/';
    this.liveMusicPlaylistUpdateUrl         = 'api/playlist/update/';
    this.liveMusicPlaylistDetailAddUrl      = 'api/playlist/detail/add/';
    this.liveMusicPlaylistDetailDeleteUrl   = 'api/playlist/detail/delete/';

    this.liveSerieListUrl           = 'api/serie/list';
    this.liveSerieDetailListUrl     = 'api/serie/detail/list/';
    this.liveSerieDetailViewAddUrl  = 'api/serie/detail/view/add/';

    this.liveProductionListUrl      = 'api/list/production';
    this.aboutListUrl               = 'api/list/about';
    this.feedListUrl                = 'api/list/feed';

    this.liveAccountCheckUrl        = 'api/account/check/';
    this.liveAccountAddUrl          = 'api/account/add/';
    this.liveDeviceAddUrl           = 'api/device/add/';
    
    this.liveProfileAddUrl          = 'api/live/profile/add';
    this.liveProfileStatsUrl        = 'api/live/profile/stats/';

    this.liveSearchUrl              = 'api/search/';

    // News
    this.liveNewsListUrl            = 'api/live/news/list';
    this.liveNewsViewAddUrl         = 'api/live/news/view/add';
    this.liveNewsDetailListUrl      = 'api/live/news/detail/list';
    this.liveRelatedNewsListUrl     = 'api/live/news/related/list';

    // Sponsor
    this.liveSponsorListUrl         = 'api/live/sponsor/list';
}

/**
 * PHP REST API
 */

CloudAPI.prototype.getUserData = function(json) {
    return this.http.get('https://graph.facebook.com/v2.5/me', {params: {access_token: json.access_token, fields: 'id,name,gender,location,picture,email,birthday'}});
};

CloudAPI.prototype.liveList = function(json) {
    return this.http.get(this.baseUrl + this.liveListUrl + json.version + "/" + json.platform);
};

CloudAPI.prototype.liveViewAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveViewAddUrl + json.id + "/" + json.uuid);
};

CloudAPI.prototype.liveProfileStats = function(json) {
    return this.http.get(this.baseUrl + this.liveProfileStatsUrl + json.uuid);
};

// Music

CloudAPI.prototype.liveMusicConnectList = function() {
    return this.http.get(this.baseUrl + this.liveMusicConnectListUrl);
};

CloudAPI.prototype.liveMusicTopList = function() {
    return this.http.get(this.baseUrl + this.liveMusicTopListUrl);
};

CloudAPI.prototype.liveMusicNewList = function() {
    return this.http.get(this.baseUrl + this.liveMusicNewListUrl);
};

CloudAPI.prototype.liveMusicRecentList = function() {
    return this.http.get(this.baseUrl + this.liveMusicRecentListUrl);
};

CloudAPI.prototype.liveMusicRecommendList = function() {
    return this.http.get(this.baseUrl + this.liveMusicRecommendListUrl);
};

CloudAPI.prototype.liveMusicFeatureList = function() {
    return this.http.get(this.baseUrl + this.liveMusicFeatureListUrl);
};

CloudAPI.prototype.liveMusicHistoryList = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicHistoryListUrl + json.uuid );
};

CloudAPI.prototype.liveMusicForYouList = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicForYouListUrl + json.uuid );
};

CloudAPI.prototype.liveMusicChartList = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicChartListUrl + json.filter );
};

CloudAPI.prototype.liveMusicList = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicListUrl + json.album);
};

CloudAPI.prototype.liveArtistMusicList = function(json) {
    return this.http.get(this.baseUrl + this.liveArtistMusicListUrl + json.artist);
};

CloudAPI.prototype.liveMusicDownloadList = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicDownloadListUrl + json.uuid);
};

CloudAPI.prototype.liveMusicSaveList = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicSaveListUrl + json.uuid);
};

CloudAPI.prototype.liveMusicViewAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicViewAddUrl + json.id + "/" + json.uuid + "/" + json.title);
};

CloudAPI.prototype.liveMusicSaveAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicSaveAddUrl + json.music_id + "/" + json.uuid + "/" + json.title);
};

CloudAPI.prototype.liveMusicSaveCheck = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicSaveCheckUrl + json.music_id + "/" + json.uuid);
};

CloudAPI.prototype.liveMusicSaveDelete = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicSaveDeleteUrl + json.music_id + "/" + json.uuid);
};

CloudAPI.prototype.liveMusicDownloadAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicDownloadAddUrl + json.music_id + "/" + json.uuid + "/" + json.title);
};

CloudAPI.prototype.liveMusicDownloadDelete = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicDownloadDeleteUrl + json.music_id + "/" + json.uuid);
};

CloudAPI.prototype.liveMusicDownloadCheck = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicDownloadCheckUrl + json.music_id + "/" + json.uuid);
};

// Music Video (MV)

CloudAPI.prototype.liveMVList = function() {
    return this.http.get(this.baseUrl + this.liveMVListUrl);
};

CloudAPI.prototype.liveMVTopList = function() {
    return this.http.get(this.baseUrl + this.liveMVTopListUrl);
};

CloudAPI.prototype.liveMVNewList = function() {
    return this.http.get(this.baseUrl + this.liveMVNewListUrl);
};

CloudAPI.prototype.liveMVRecentList = function() {
    return this.http.get(this.baseUrl + this.liveMVRecentListUrl);
};

CloudAPI.prototype.liveMVDetailList = function(json) {
    return this.http.get(this.baseUrl + this.liveMVDetailListUrl + json.album);
}

CloudAPI.prototype.liveMVViewAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveMVViewAddUrl + json.id + "/" + json.uuid);
};

CloudAPI.prototype.liveMVDetailViewAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveMVDetailViewAddUrl + json.id + "/" + json.title + "/" + json.uuid);
};

// Album & Artist

CloudAPI.prototype.liveAlbumList = function(json) {
    return this.http.get(this.baseUrl + this.liveAlbumListUrl + json.filter);
};

CloudAPI.prototype.liveArtistList = function(json) {
    return this.http.get(this.baseUrl + this.liveArtistListUrl + json.filter);
};

CloudAPI.prototype.liveAlbumViewAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveAlbumViewAddUrl + json.id + "/" + json.uuid);
};

CloudAPI.prototype.liveArtistViewAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveArtistViewAddUrl + json.id + "/" + json.uuid);
};

// Playlist

CloudAPI.prototype.liveMusicPlaylistList = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicPlaylistListUrl + json.uuid);
};

CloudAPI.prototype.liveMusicPlaylistDetailList = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicPlaylistDetailListUrl + json.playlist_id);
};

CloudAPI.prototype.liveMusicPlaylistFeatureList = function() {
    return this.http.get(this.baseUrl + this.liveMusicPlaylistFeatureListUrl);
};

CloudAPI.prototype.liveMusicPlaylistAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicPlaylistAddUrl + json.name + "/" + json.uuid);
};

CloudAPI.prototype.liveMusicPlaylistDelete = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicPlaylistDeleteUrl + json.name + "/" + json.uuid);
};

CloudAPI.prototype.liveMusicPlaylistUpdate = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicPlaylistUpdateUrl + json.id + "/"  + json.name + "/" + json.uuid);
};

CloudAPI.prototype.liveMusicPlaylistDetailAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicPlaylistDetailAddUrl + json.music_id + "/" + json.playlist_id + "/" + json.uuid);
};

CloudAPI.prototype.liveMusicPlaylistDetailDelete = function(json) {
    return this.http.get(this.baseUrl + this.liveMusicPlaylistDetailDeleteUrl + json.music_id + "/" + json.playlist_id + "/" + json.uuid);
};

// Serie

CloudAPI.prototype.liveSerieList = function() {
    return this.http.get(this.baseUrl + this.liveSerieListUrl);
};

CloudAPI.prototype.liveSerieDetailList = function(json) {
    return this.http.get(this.baseUrl + this.liveSerieDetailListUrl + json.serie);
};

CloudAPI.prototype.liveSerieDetailViewAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveSerieDetailViewAddUrl + json.id + "/" + json.uuid);
};

// Other

CloudAPI.prototype.liveProductionList = function() {
    return this.http.get(this.baseUrl + this.liveProductionListUrl);
};

CloudAPI.prototype.aboutList = function() {
    return this.http.get(this.baseUrl + this.aboutListUrl);
};

CloudAPI.prototype.feedList = function() {
    return this.http.get(this.baseUrl + this.feedListUrl);
};

// Account

CloudAPI.prototype.liveAccountCheck = function(json) {
    return this.http.get(this.baseUrl + this.liveAccountCheckUrl + json.account);
};

CloudAPI.prototype.liveAccountAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveAccountAddUrl + json.account + "/" + json.uuid);
};

CloudAPI.prototype.liveDeviceAdd = function(json) {
    return this.http.get(this.baseUrl + this.liveDeviceAddUrl + json.uuid + "/" + json.model + "/" + json.platform + "/" + json.version);
};

CloudAPI.prototype.liveProfileAdd = function(json) {
    return this.http.post(this.baseUrl + this.liveProfileAddUrl, json);
};

// Search

CloudAPI.prototype.liveSearch = function(json) {
    return this.http.get(this.baseUrl + this.liveSearchUrl + json.searchBy + "/" + json.searchText);
};

// News
CloudAPI.prototype.liveNewsList = function() {
    return this.http.get(this.baseUrl + this.liveNewsListUrl);
};

CloudAPI.prototype.liveNewsViewAdd = function(json) {
    return this.http.post(this.baseUrl + this.liveNewsViewAddUrl, json);
};

CloudAPI.prototype.liveNewsDetailList = function(json) {
    return this.http.get(this.baseUrl + this.liveNewsDetailListUrl + "/" + json.news_id);
};

CloudAPI.prototype.liveRelatedNewsList = function(json) {
    return this.http.get(this.baseUrl + this.liveRelatedNewsListUrl + "/" + json.news_id);
};

// Sponsor
CloudAPI.prototype.liveSponsorList = function() {
    return this.http.get(this.baseUrl + this.liveSponsorListUrl);
};


module.exports = new CloudAPI();

