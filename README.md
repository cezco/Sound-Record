# SoundRecorder
Some web applications require an MP3 recorder to record sound directly from the user. The sound is converted to mono MP3 format with an adjustable sample rate and bit rate to reduce the output file size.

A page can contain several MP3 recorders that can be used interchangeably. The recording process can be paused and can be resumed to continue the recording process.

# Reqirement

1. Lame
2. jQuery 1.11.1

# Example 

```html
<html>
<head>
    <title>MP3 Recorder</title>
    <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" type="text/css" href="css/css.css">
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script type="text/javascript" src="js/lame.js"></script>
	<script type="text/javascript" src="js/js.js"></script>
</head>

<body>
<style type="text/css">
.audio-tool-wrapper {
	display:flex;
	justify-content:center;
}

.audio-tool-wrapper > span {
	width:100px;
	margin:8px;
	text-align:center;
	position:relative;
	display:block;
}
</style>

<h1>MP3 Recorder</h1>
	<div class="audio-recorder" data-question-id="12" data-audio-index="1">
    	<div class="audio-tool-wrapper">
        	<span><a class="audio-tool tool-browse" title="Pilih File Suara"><span></span></a></span>
        	<span><a class="audio-tool tool-record" title="Rekam Langsung"><span></span></a></span>
        	<span><a class="audio-tool tool-play" title="Dengarkan"><span></span></a></span>
        	<span><a class="audio-tool tool-stop" title="Hentikan"><span></span></a></span>
        	<span><a class="audio-tool tool-upload" title="Unggah Suara"><span></span></a></span>
        	<span><a class="audio-tool tool-download" title="Unduh Suara"><span></span></a></span>
        	<span><a class="audio-tool tool-delete" title="Hapus Suara"><span></span></a></span>
            <span><span class="tool-timer"><i></i></span></span>
        </div>
    </div>
	<div class="audio-recorder" data-question-id="12" data-audio-index="2">
    	<div class="audio-tool-wrapper">
        	<span><a class="audio-tool tool-browse"><span></span></a></span>
        	<span><a class="audio-tool tool-record"><span></span></a></span>
        	<span><a class="audio-tool tool-play"><span></span></a></span>
        	<span><a class="audio-tool tool-stop"><span></span></a></span>
        	<span><a class="audio-tool tool-upload"><span></span></a></span>
        	<span><a class="audio-tool tool-download"><span></span></a></span>
        	<span><a class="audio-tool tool-delete"><span></span></a></span>
            <span><span class="tool-timer"><i></i></span></span>
        </div>
    </div>
<script type="text/javascript">

var audioRecorder = {
	initialized:false,
	recorder:[]
};
var params = {
	bitrate:32,
	sampleRate:44100,
	timeLimit:1800,
	uploadSound:function(audio, duration, index, questionID, audioIndex){
		console.log(audio.src);
		audioRecorder.recorder[index].beforeUpload();
		setTimeout(function(){
			audioRecorder.recorder[index].afterUpload();
		}, 2000);
		var url = audio.src;
		$.ajax({
			url:'upload-sound.php',
			type:'POST',
			dataType:"json",
			data:{
				sound_data:url,
				question_id:questionID,
				audio_index:audioIndex
			},
			success: function(data)
			{
				console.log('Uploaded');
			}
		});     
	},
	downloadSound:function(audio, duration, index, questionID, audioIndex)
	{
		console.log(audio.src);

		//Create a URL to the blob.
		/*
		var url = window.URL.createObjectURL(blob);
		window.open(url);
		*/

	},
	nullAudio:function()
	{
		alert('Belum ada audio cuyy! Selesaikan rekaman dulu...');
	},
	stillRecording:function()
	{
		alert('Masih merekam cuyy! Selesaikan dulu yach...');
	},
	stillPlaying:function()
	{
		alert('Masih memutar cuyy! Ga boleh merekam dulu... Pause dulu kek, atau tunggu selesai...');
	},
	overLimit:function()
	{
		alert('Melebihi batas');
	},
	log:function(text)
	{
		console.log(text);
	}
};

$(document).ready(function(e) {

	$(document).on('click', '.audio-recorder .tool-browse', function(e)
	{
		var audioController = $(this).closest('.audio-recorder');
		var idx = audioController.attr("data-index") || "";
		if(idx == "")
		{
			var index = audioRecorder.recorder.length;
			audioRecorder.recorder.push(new MP3Recorder(audioController, index, 'browse', params));
		}
		
	});
	
	$(document).on('click', '.audio-recorder .tool-record', function(e)
	{		
		var audioController = $(this).closest('.audio-recorder');
		var idx = audioController.attr("data-index") || "";
		if(idx == "")
		{
			var index = audioRecorder.recorder.length;
			audioRecorder.recorder.push(new MP3Recorder(audioController, index, 'record', params));
		}
	})	
});

</script>
</body>
</html>


```
