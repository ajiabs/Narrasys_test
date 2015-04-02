angular.module('com.inthetelling.story')
	.service('AssetDataModel', function AssetDataModel() {
		
		this.data = [{
            "_id": "52697c7add4736339000000d",
            "master_asset": false,
            "container_id": "51faa6aedd47368861000009",
            "filename": "lyman.jpg",
            "original_filename": "lyman.jpg",
            "extension": "jpg",
            "content_type": "image/jpeg",
            "size": 141273,
            "name": "lyman",
            "url": "uploads/asset/image/attachment/52697c7add4736339000000d",
            "frame_rate": null,
            "frame_rate_n": null, 
            "frame_rate_d": null,
            "start_time": null,
            "width": null,
            "height": null
        },
        {
            "_id": "52697e56dd4736950b00000e",
            "master_asset": false,
            "container_id": "51faa6aedd47368861000009",
            "filename": "beach.mp4",
            "original_filename": "beach.mp4",
            "extension": "mp4",
            "content_type": "application/octet-stream",
            "size": 2139606,
            "name": "beach",
            "url": "uploads/asset/video/attachment/52697e56dd4736950b00000e",
            "frame_rate": "25/1",
            "frame_rate_n": 25, 
            "frame_rate_d": 1,
            "start_time": "0.000000",
            "width": 640,
            "height": 360
        }
    ];
	});


