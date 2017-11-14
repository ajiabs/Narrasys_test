
FILES=$(find . -type f -name '*.ts')

for file in $FILES
do
  read -r fline < $file
  echo $fline
done
