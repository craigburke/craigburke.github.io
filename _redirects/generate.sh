#!/bin/bash

url_prefix="http://www.craigburke.com/"

IFS=", "
while read old_url new_url 
do	
	old_url=${old_url#$url_prefix}
	new_url=${new_url#$url_prefix}	
	extension=${old_url##*.}

	case $extension in 
		"htm" | "html" )
			destination_file="../$old_url" ;;
		* )
                        destination_file="../$old_url/index.html" ;;
	esac

	destination_path=${destination_file%/*}
	mkdir -p $destination_path

	cat > $destination_file <<-EOF
	---
	layout: redirect
	redirect: /$new_url
	---
	EOF

done < links.csv
