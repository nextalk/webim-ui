<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>File upload</title>
</head>
<body>
<?php
error_reporting(E_ALL | E_STRICT);
require('UploadHandler.php');
$upload = new UploadHandler(null, false);
$data = $upload->post(false);
$data = isset( $data["files"] ) && count( $data["files"] )
	? $data["files"] : array( array("error" => "Upload failed") );
$data = json_encode( $data );
?>
<div id="result">
<?php echo $data ?>
</div>
<script type="text/javascript">
var result = <?php echo json_encode( $data ) ?>;
window.name = result;
try {
	var target = parent && parent.postMessage 
		? parent 
		: (parent && parent.document.postMessage ? parent.document : undefined);

	if (typeof target != "undefined") {
		target.postMessage(result, "*");
	}
} catch (e) {/**/}
</script>
</body>
</html>
