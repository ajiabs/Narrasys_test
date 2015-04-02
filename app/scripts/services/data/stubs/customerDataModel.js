angular.module('com.inthetelling.story')
	.service('CustomerDataModel', function CustomerDataModel() {

		this.data = [
			[{
				"_id": "528fa665ba4f654bbe000001",
				"active": true,
				"create_s3_transcodes": false,
				"created_at": "2013-11-20T03:45:57Z",
				"domains": ["api-dev-sub"],
				"guest_access_allowed": true,
				"name": "Test Customer",
				"updated_at": "2014-06-11T19:29:35Z",
				"youtube_allowed": false,
				"oauth2_message": {
					"en": "<p><b><center>Register to receive Friends of USC badges and Connect with USC Scholars</center></b></p><p>The Connecting with USC Scholars project is experimenting with digital badges as a pathway to connecting with USC Scholars. Digital badges are graphic icons that represent accomplishments and indicate your affiliation with an organization. USC Scholar badges will be hosted on the <a href=\"https://credly.com/\">Credly</a> badge platform. You can also share USC Scholar badges on social networks including Twitter, FaceBook and LinkedIN.</p><p>In order to receive Friends of USC digital badges, you will need to register so that the badge information can be e-mailed to you.</p><p>Registration is simple.  Choose one of the third party providers above to login.  If you choose the \"None\" option, you will not be logged in but rather you will be treated as a guest.  That would prohibit you from earning badges.</p><p>Once you have registered, you earn badges by watching a scholar's background video, watching the scholar's micro-lesson and participating in their online activity.  After earning a badge, you will be provided with contact information that allows you to connect with the USC scholar during the program.</p><p>USC will <b>only</b> use your information for badge distribution and will <b>not</b> use your information for any other purpose. If you have questions about this registration process, please send email to USC Educational Technologies (<a href=\"mailto:edtech@usc.edu\">edtech@usc.edu</a>).</p>"
				},
				"oauth2_providers": ["google", "facebook", "twitter", "linkedin", "wordpress"]
			}, {
				"_id": "532311beba4f652173000003",
				"active": true,
				"create_s3_transcodes": true,
				"created_at": "2014-03-11T08:27:10Z",
				"domains": ["api-dev"],
				"guest_access_allowed": false,
				"login_url": "http://bb1.inthetelling.com",
				"login_via_top_window_only": true,
				"name": "API Development",
				"updated_at": "2014-05-20T14:44:21Z",
				"youtube_allowed": true,
				"oauth2_message": {
					"en": "<p><b><center>Register to receive Friends of USC badges and Connect with USC Scholars</center></b></p><p>The Connecting with USC Scholars project is experimenting with digital badges as a pathway to connecting with USC Scholars. Digital badges are graphic icons that represent accomplishments and indicate your affiliation with an organization. USC Scholar badges will be hosted on the <a href=\"https://credly.com/\">Credly</a> badge platform. You can also share USC Scholar badges on social networks including Twitter, FaceBook and LinkedIN.</p><p>In order to receive Friends of USC digital badges, you will need to register so that the badge information can be e-mailed to you.</p><p>Registration is simple.  Choose one of the third party providers above to login.  If you choose the \"None\" option, you will not be logged in but rather you will be treated as a guest.  That would prohibit you from earning badges.</p><p>Once you have registered, you earn badges by watching a scholar's background video, watching the scholar's micro-lesson and participating in their online activity.  After earning a badge, you will be provided with contact information that allows you to connect with the USC scholar during the program.</p><p>USC will <b>only</b> use your information for badge distribution and will <b>not</b> use your information for any other purpose. If you have questions about this registration process, please send email to USC Educational Technologies (<a href=\"mailto:edtech@usc.edu\">edtech@usc.edu</a>).</p>"
				},
				"oauth2_providers": ["google", "facebook", "linkedin"]
			}]

		];
	});
