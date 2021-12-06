#!/bin/bash

for i in "$@"
do
case $i in
    -s=*|--source-dir=*)
    source_dir="${i#*=}"
    shift
    ;;
    -a=*|--archive-dir=*)
    archive_dir="${i#*=}"
    shift
    ;;
    -n=*|--archive-name=*)
    archive_name="${i#*=}"
    shift
    ;;
    *)
    # unknown option
    echo -e "\t-s,--source-dir: directory which you want to archive in phase. Can not be null."
    echo -e "\t-a,--archive-dir: directory where stores all archives. Default is [SOURCE-DIR]_archive."
    echo -e "\t-n,--archive-name: Name of the archive directory for this time. Default is {date '+%Y%m%d} like 19900101'."
    exit 0
    ;;
esac
done
if [ ! $source_dir ]; then
    echo "The \"source-dir\" parameter can't be null."
    exit 0
fi
archive_dir=${archive_dir:="${source_dir}_archive"}
mkdir -p $archive_dir
archive_name=${archive_name:=`date '+%Y%m%d'`}
echo "source_dir    = ${source_dir}"
echo "archive_dir   = ${archive_dir}"
echo "archive_name  = ${archive_name}"
dest_name="$archive_dir/$archive_name"
compare_cmd=`ls -d $archive_dir/* | awk '{ printf("--compare-dest=%s ",$1)}'`
rsync_cmd="rsync -avry --itemize-changes --size-only $compare_cmd $source_dir/ $dest_name/"
shopt -s globstar
$rsync_cmd
echo "executed script: $rsync_cmd"
