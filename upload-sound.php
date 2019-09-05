<?php
$sound_data = $_POST['sound_data'];
$question_id = $_POST['question_id'];
$audio_index = $_POST['audio_index'];
$data = split(",", $sound_data);
$sound = @$data[1];
if(strlen($sound))
{
	$sound = base64_decode($sound);
	file_put_contents($question_id."-".$audio_index.".mp3", $sound);
}
?>
